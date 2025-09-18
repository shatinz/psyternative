
import { db } from "@/lib/firebase";
import type { ExperienceReport, Comment, ExperienceCategory, UserProfile } from "@/types";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";


// --- Data Transformation Functions ---

function transformDocToExperience(docSnap: any, authorUsernames: Map<string, string>): ExperienceReport {
  const data = docSnap.data();
  const authorId = data.authorId;
  const authorUsername = authorUsernames.get(authorId) || 'Anonymous';

  const comments = (data.comments || []).map((comment: any) => ({
      ...comment,
      author: authorUsernames.get(comment.authorId) || 'Anonymous',
      createdAt: (comment.createdAt as Timestamp).toDate(),
  })).sort((a: Comment, b: Comment) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    id: docSnap.id,
    ...data,
    author: authorUsername,
    createdAt: (data.createdAt as Timestamp).toDate(),
    comments: comments,
  } as ExperienceReport;
}


// --- Data Access Functions ---

export async function getExperiences(qs?: string, category?: ExperienceCategory): Promise<ExperienceReport[]> {
  const experiencesCol = collection(db, "experiences");
  
  let q;
  if (category) {
    q = query(experiencesCol, where("experienceType", "==", category), orderBy("createdAt", "desc"));
  } else {
    q = query(experiencesCol, orderBy("createdAt", "desc"));
  }

  const experienceSnapshot = await getDocs(q);
  
  // Get all unique authorIds from all experiences and their comments first
  const authorIds = new Set<string>();
  experienceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if(data.authorId) authorIds.add(data.authorId);
      if(data.comments) {
          data.comments.forEach((c: any) => {
              if(c.authorId) authorIds.add(c.authorId);
          });
      }
  });

  const authorUsernames = await getAuthorUsernames(Array.from(authorIds));

  const experienceList = experienceSnapshot.docs.map(doc => transformDocToExperience(doc, authorUsernames));

  if (qs) {
    const lowercasedQuery = qs.toLowerCase();
    return experienceList.filter(e => 
        e.title.toLowerCase().includes(lowercasedQuery) ||
        e.reportText.toLowerCase().includes(lowercasedQuery) ||
        e.author.toLowerCase().includes(lowercasedQuery)
    );
  }

  return experienceList;
}

export async function getExperienceById(id: string): Promise<ExperienceReport | undefined> {
  const experienceDocRef = doc(db, "experiences", id);
  const experienceDoc = await getDoc(experienceDocRef);

  if (experienceDoc.exists()) {
    const data = experienceDoc.data();
    const authorIds = new Set<string>();
    if (data.authorId) authorIds.add(data.authorId);
    if (data.comments) {
        data.comments.forEach((c:any) => {
            if(c.authorId) authorIds.add(c.authorId)
        });
    }

    const authorUsernames = await getAuthorUsernames(Array.from(authorIds));
    return transformDocToExperience(experienceDoc, authorUsernames);
  } else {
    return undefined;
  }
}

export async function createExperience(data: { title: string; reportText: string; experienceType: ExperienceCategory; summary: string, authorId: string }): Promise<ExperienceReport> {
  const newExperienceData = {
    ...data,
    createdAt: serverTimestamp(),
    comments: [],
  };

  const docRef = await addDoc(collection(db, "experiences"), newExperienceData);
  const createdDocSnap = await getDoc(docRef);
  const createdDocData = createdDocSnap.data();

  const authorProfile = await getUserProfile(data.authorId);

  return {
    id: docRef.id,
    title: data.title,
    reportText: data.reportText,
    experienceType: data.experienceType,
    summary: data.summary,
    authorId: data.authorId,
    createdAt: (createdDocData?.createdAt as Timestamp).toDate(),
    author: authorProfile?.username ?? 'Anonymous',
    comments: []
  };
}

export async function addComment(experienceId: string, data: { text: string; authorId: string }): Promise<Comment | null> {
    const experienceRef = doc(db, "experiences", experienceId);
    
    const newCommentData = {
        id: `c${Math.random().toString(36).substring(2, 9)}`,
        text: data.text,
        authorId: data.authorId,
        createdAt: serverTimestamp(),
    };
    
    await updateDoc(experienceRef, {
        comments: arrayUnion(newCommentData)
    });
    
    const authorProfile = await getUserProfile(data.authorId);

    // Note: serverTimestamp will be null on the client until it's processed by the server.
    // We return the current date for immediate UI updates.
    return {
        ...newCommentData,
        createdAt: new Date(),
        author: authorProfile?.username ?? 'Anonymous',
    };
}

// --- User Profile Functions ---

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt'>) {
    console.log(`[DATA] createUserProfile START - UID: ${uid}`);
    const userRef = doc(db, "users", uid);
    const profileData = {
        ...data,
        uid,
        createdAt: serverTimestamp()
    };
    await setDoc(userRef, profileData, { merge: true });
    console.log(`[DATA] createUserProfile END - UID: ${uid}`);
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    console.log(`[DATA] getUserProfile START - UID: ${uid}`);
    if (!uid) {
        console.error("[DATA] getUserProfile ERROR - received null or undefined UID.");
        return null;
    }
    const userRef = doc(db, "users", uid);
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log(`[DATA] getUserProfile SUCCESS - Found user: ${userData.username}`);
            return {
                uid: userSnap.id,
                username: userData.username,
                displayName: userData.displayName,
                email: userData.email,
                createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
            };
        } else {
            console.log(`[DATA] getUserProfile SUCCESS - No profile document found for UID: ${uid}`);
            return null;
        }
    } catch (error) {
        console.error(`[DATA] getUserProfile ERROR - Failed to fetch profile for UID: ${uid}`, error);
        return null; // Return null on error to prevent crashes
    }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
    console.log(`[DATA] getUserByUsername START - Username: ${username}`);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            console.log(`[DATA] getUserByUsername SUCCESS - Found user for username: ${username}`);
            return { 
                uid: userDoc.id, 
                ...userData,
                createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
            } as UserProfile;
        } else {
            console.log(`[DATA] getUserByUsername SUCCESS - No user found for username: ${username}`);
            return null;
        }
    } catch (error) {
        console.error(`[DATA] getUserByUsername ERROR - Failed to query for username: ${username}`, error);
        return null;
    }
}

export async function isUsernameUnique(username: string): Promise<boolean> {
    console.log(`[DATA] isUsernameUnique START - Checking for: ${username}`);
    const user = await getUserByUsername(username);
    const isUnique = user === null;
    console.log(`[DATA] isUsernameUnique END - Result for ${username}: ${isUnique}`);
    return isUnique;
}

// --- Helper Functions ---
async function getAuthorUsernames(authorIds: string[]): Promise<Map<string, string>> {
  const usernames = new Map<string, string>();
  if (authorIds.length === 0) {
    return usernames;
  }

  // Firestore 'in' query limitation is 30. We need to batch requests.
  const idBatches: string[][] = [];
  for (let i = 0; i < authorIds.length; i += 30) {
      const batch = authorIds.slice(i, i + 30);
      idBatches.push(batch);
  }

  for (const batch of idBatches) {
    if (batch.length === 0) continue;
    const usersQuery = query(collection(db, "users"), where("uid", "in", batch));
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      usernames.set(userData.uid, userData.username || 'Anonymous');
    });
  }
  
  return usernames;
}

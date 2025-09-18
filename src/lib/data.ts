
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
  writeBatch,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// --- Data Transformation Functions ---

async function experienceFromDoc(doc: any, allUsers: Map<string, UserProfile>): Promise<ExperienceReport> {
  const data = doc.data();
  
  const authorUsername = allUsers.get(data.authorId)?.username || "Anonymous";

  const comments = (data.comments || []).map((comment: any) => {
      const commentAuthorUsername = allUsers.get(comment.authorId)?.username || "Anonymous";
      return {
          ...comment,
          author: commentAuthorUsername,
          createdAt: (comment.createdAt as Timestamp).toDate(),
      }
  }).sort((a: Comment, b: Comment) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    id: doc.id,
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

  // Fetch all required user profiles in a single query if there are any
  const allUsers = new Map<string, UserProfile>();
  const idsToFetch = Array.from(authorIds);

  if (idsToFetch.length > 0) {
      // Firestore 'in' queries are limited to 30 elements.
      // We need to batch the requests if there are more than 30 authors.
      const userBatches: Promise<any>[] = [];
      for (let i = 0; i < idsToFetch.length; i += 30) {
          const batch = idsToFetch.slice(i, i + 30);
          userBatches.push(getDocs(query(collection(db, "users"), where("uid", "in", batch))));
      }
      
      const userSnapshots = await Promise.all(userBatches);
      userSnapshots.forEach(userSnapshot => {
          userSnapshot.forEach((userDoc: any) => {
              const userData = userDoc.data() as UserProfile;
              allUsers.set(userData.uid, userData);
          });
      });
  }

  const experienceList = await Promise.all(experienceSnapshot.docs.map(doc => experienceFromDoc(doc, allUsers)));

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
    // This function can be simpler and also leverage the batched approach if it becomes a bottleneck.
    // For a single document, fetching authors one by one is acceptable.
    const data = experienceDoc.data();
    const authorIds = new Set<string>();
    if (data.authorId) authorIds.add(data.authorId);
    if (data.comments) {
        data.comments.forEach((c:any) => {
            if(c.authorId) authorIds.add(c.authorId)
        });
    }

    const allUsers = new Map<string, UserProfile>();
    const idsToFetch = Array.from(authorIds);
     if (idsToFetch.length > 0) {
      // Firestore 'in' queries are limited to 30 elements.
      // We need to batch the requests if there are more than 30 authors.
      const userBatches: Promise<any>[] = [];
      for (let i = 0; i < idsToFetch.length; i += 30) {
          const batch = idsToFetch.slice(i, i + 30);
          userBatches.push(getDocs(query(collection(db, "users"), where("uid", "in", batch))));
      }
      
      const userSnapshots = await Promise.all(userBatches);
      userSnapshots.forEach(userSnapshot => {
          userSnapshot.forEach((userDoc: any) => {
              const userData = userDoc.data() as UserProfile;
              allUsers.set(userData.uid, userData);
          });
      });
  }

    return experienceFromDoc(experienceDoc, allUsers);
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

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid' | 'createdAt'> & {createdAt?: Date}) {
    const userRef = doc(db, "users", uid);
    const profileData = {
        ...data,
        uid,
        createdAt: data.createdAt ? Timestamp.fromDate(data.createdAt) : serverTimestamp()
    };
    return setDoc(userRef, profileData);
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
            uid: userSnap.id,
            username: userData.username,
            displayName: userData.displayName,
            email: userData.email,
            createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
        };
    }
    return null;
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return { 
            uid: userDoc.id, 
            ...userData,
            createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
        } as UserProfile;
    }
    return null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        return { 
            uid: userDoc.id, 
            ...userData,
            createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
        } as UserProfile;
    }
    return null;
}

export async function isUsernameUnique(username: string): Promise<boolean> {
    const user = await getUserByUsername(username);
    return user === null;
}

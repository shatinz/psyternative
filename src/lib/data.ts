
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

async function experienceFromDoc(doc: any): Promise<ExperienceReport> {
  const data = doc.data();
  
  const commentsData = data.comments || [];
  const authorIds = [data.authorId, ...commentsData.map((c: any) => c.authorId)];
  const uniqueAuthorIds = [...new Set(authorIds)].filter(id => id);

  let authors: { [key: string]: UserProfile } = {};

  if (uniqueAuthorIds.length > 0) {
      const usersSnapshot = await getDocs(query(collection(db, "users"), where("uid", "in", uniqueAuthorIds)));
      usersSnapshot.forEach(userDoc => {
          const userData = userDoc.data() as UserProfile;
          authors[userData.uid] = userData;
      });
  }

  return {
    id: doc.id,
    ...data,
    author: authors[data.authorId]?.username || "Anonymous",
    createdAt: (data.createdAt as Timestamp).toDate(),
    comments: commentsData.map((comment: any) => ({
      ...comment,
      author: authors[comment.authorId]?.username || "Anonymous",
      createdAt: (comment.createdAt as Timestamp).toDate(),
    })).sort((a: Comment, b: Comment) => b.createdAt.getTime() - a.createdAt.getTime()),
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
  const experienceList = await Promise.all(experienceSnapshot.docs.map(experienceFromDoc));

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
    return experienceFromDoc(experienceDoc);
  } else {
    return undefined;
  }
}

export async function createExperience(data: { title: string; reportText: string; experienceType: ExperienceCategory; summary: string, authorId: string }): Promise<ExperienceReport> {
  const newExperienceData = {
    createdAt: serverTimestamp(),
    comments: [],
    ...data,
  };

  const docRef = await addDoc(collection(db, "experiences"), newExperienceData);
  const createdDoc = await getDoc(docRef);

  const authorProfile = await getUserProfile(data.authorId);

  return {
    id: docRef.id,
    ...newExperienceData,
    createdAt: (createdDoc.data()?.createdAt as Timestamp).toDate(),
    author: authorProfile?.username ?? 'Anonymous',
    comments: []
  };
}

export async function addComment(experienceId: string, data: { text: string; authorId: string }): Promise<Comment | null> {
    const experienceRef = doc(db, "experiences", experienceId);
    const experienceSnap = await getDoc(experienceRef);

    if (!experienceSnap.exists()) return null;

    const newComment: any = {
        id: `c${Math.random().toString(36).substring(2, 9)}`,
        createdAt: serverTimestamp(),
        ...data,
    };
    
    await updateDoc(experienceRef, {
        comments: arrayUnion(newComment)
    });
    
    const authorProfile = await getUserProfile(data.authorId);

    return {
        ...newComment,
        createdAt: new Date(),
        author: authorProfile?.username ?? 'Anonymous',
    };
}

// --- User Profile Functions ---

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid'>) {
    const userRef = doc(db, "users", uid);
    return setDoc(userRef, { ...data, uid });
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
            ...userData,
            uid: userSnap.id,
            createdAt: (userData.createdAt as Timestamp)?.toDate() || new Date(),
        } as UserProfile;
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

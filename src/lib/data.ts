import { db } from "@/lib/firebase";
import type { ExperienceReport, Comment, ExperienceCategory } from "@/types";
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
} from "firebase/firestore";

// --- Data Transformation Functions ---

function experienceFromDoc(doc: any): ExperienceReport {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    // Firestore Timestamps in comments need to be converted to Dates
    comments: (data.comments || []).map((comment: any) => ({
      ...comment,
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
  const experienceList = experienceSnapshot.docs.map(experienceFromDoc);

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

export async function createExperience(data: { title: string; reportText: string; experienceType: ExperienceCategory; summary: string, author: string }): Promise<ExperienceReport> {
  const newExperienceData = {
    createdAt: new Date(),
    comments: [],
    ...data,
  };

  const docRef = await addDoc(collection(db, "experiences"), newExperienceData);

  return {
    id: docRef.id,
    ...newExperienceData
  };
}

export async function addComment(experienceId: string, data: { text: string; author: string }): Promise<Comment | null> {
    const experienceRef = doc(db, "experiences", experienceId);
    const experienceSnap = await getDoc(experienceRef);

    if (!experienceSnap.exists()) return null;

    const newComment: any = {
        id: `c${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        ...data,
    };
    
    await updateDoc(experienceRef, {
        comments: arrayUnion(newComment)
    });

    return {
        ...newComment,
        createdAt: newComment.createdAt // Already a Date object
    };
}

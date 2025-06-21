// utils/toClient.ts
export function toClient<T extends { _id: any }>(doc: T): Omit<T, '_id'> & { id: string } {
    const { _id, ...rest } = doc as any;
    return {
      ...rest,
      id: _id.toString(),
    };
}
  
export function toClientList<T extends { _id: any }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
    return docs.map(toClient);
}

export const toClientWithSubtasks = (doc: any) => ({
    id: doc._id.toString(),
    title: doc.title,
    status: doc.status,
    date: doc.date,
    subTasks: doc.subTasks?.map((sub: any) => ({
        id: sub._id.toString(),
        content: sub.content,
        completed: sub.completed,
        trainPlanId: sub.trainPlanId.toString()
    }))
});
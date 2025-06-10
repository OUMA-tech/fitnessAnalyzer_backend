// utils/toClient.ts
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

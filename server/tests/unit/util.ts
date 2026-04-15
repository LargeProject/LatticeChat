type TryCatchResponse<T> = {
  data: T | null;
  error: Error | null;
};

export async function tryCatch<T>(callback: () => Promise<T>): Promise<TryCatchResponse<T>> {
  try {
    return { data: await callback(), error: null };
  } catch (error) {
    return { data: null, error: error };
  }
}

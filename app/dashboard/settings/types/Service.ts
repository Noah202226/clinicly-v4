//types/Sceeirv.ts;

export interface Service {
  /** Appwrite Document ID (optional for creation payload) */
  //   $id?: string;

  /** Name of the service (e.g., "Teeth Cleaning") */
  name: string;

  /** Detailed description of the service */
  description: string;

  /** Price of the service (e.g., 150.00) */
  price: number;

  /** Default duration of the service in minutes (e.g., 60) */
  duration: number;

  /** Array of Branch Document IDs where this service is offered (Appwrite relationship) */
  branchIds: string[];
}

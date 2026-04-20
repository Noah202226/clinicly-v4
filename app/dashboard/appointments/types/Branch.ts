import { Models } from "appwrite";

export interface Branch extends Models.Document {
  name: string;
  address: string;
  startHour: number;
  endHour: number;
}

export default Branch;

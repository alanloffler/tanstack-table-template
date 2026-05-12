import charactersData from "@/data/characters.json";

export interface ICharacter {
  id: number;
  age: number;
  birthdate: string | null;
  gender: string;
  name: string;
  occupation: string;
  portrait_path: string;
  phrases: string[];
  status: string;
}

class DataModuleService {
  private static instance: DataModuleService;

  public static getInstance(): DataModuleService {
    if (!DataModuleService.instance) {
      DataModuleService.instance = new DataModuleService();
    }
    return DataModuleService.instance;
  }

  public get(): ICharacter[] {
    return charactersData.results as ICharacter[];
  }
}

export const DataService = DataModuleService.getInstance();

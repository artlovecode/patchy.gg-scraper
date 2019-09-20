export enum Region {
  NA,
  EU,
  KR,
  CN,
  LMS,
  CIS,
  BR,
  CI,
  JP,
  LAT,
  OCE,
  SEA,
  TR,
  VN,
  NONE,
}



export enum Role {
  TOP,
  JUNGLE,
  MID,
  BOTTOM,
  SUPPORT,
  COACH,
  ANALYST,
  NONE
}

export type Player = {
  ingameName: string| null;
  team: string | null;
  role: Role | null;
  residencyRegion: Region | null;
  soloQIds: string[] | null;
};

export type Team = {
  name: string;
  region: Region;
  link?: string;
  currentActiveRoster: string[],
  currentActiveRosterLinks: string[];
};

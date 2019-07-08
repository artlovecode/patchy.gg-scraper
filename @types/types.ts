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
  ingameName: string;
  team: string;
  role: Role;
  residencyRegion: Region;
  soloQIds: string[];
};

export type Team = {
  name: string;
  region: Region;
  link?: string;
  currentActiveRoster: string[],
  currentActiveRosterLinks: string[];
};

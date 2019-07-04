export enum Region {
  NA,
  EU,
  KR,
  CN,
  LM,
  BR,
  CI,
  JP,
  LA,
  OC,
  SE,
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

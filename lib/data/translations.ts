import type { Translation } from "../bible/repository";

export const translations: Translation[] = [
  {
    id: "catholic_org",
    name: "New Jerusalem Bible",
    language: "en",
    languageName: "English",
    direction: "ltr",
    hasHeadings: false,
    hasFootnotes: false
  },
  {
    id: "sigao",
    name: "思高圣经",
    language: "zh-Hans",
    languageName: "简体中文",
    direction: "ltr",
    hasHeadings: true,
    hasFootnotes: false
  },
  {
    id: "shinkyo",
    name: "新共同訳",
    language: "ja",
    languageName: "日本語",
    direction: "ltr",
    hasHeadings: false,
    hasFootnotes: false
  },
  {
    id: "vulgate",
    name: "Biblia Sacra Vulgata",
    language: "la",
    languageName: "Latin",
    direction: "ltr",
    hasHeadings: false,
    hasFootnotes: false,
    copyright: "Public Domain"
  }
];

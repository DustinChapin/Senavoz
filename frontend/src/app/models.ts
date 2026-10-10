export interface DictionaryEntry {
  keyword: string;
  media_url: string;
  category: string | null;
}

export interface QuickPhrase {
  id: string;
  display_text: string;
  spoken_text: string;
  icon_name: string | null;
}

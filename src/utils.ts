import { getPreferenceValues, showToast, Toast } from "@raycast/api";

export const BASE_URL = "https://zeroheight.com/open_api/v2/";

interface Preferences {
  accessToken?: string;
  clientId?: string;
}

export interface StyleguideListResponse {
  status: string;
  data: {
    styleguides: { id: number; name: string; created_at: string; share_id: string }[];
  };
}

export interface StyleguideListItemData {
  id: number;
  name: string;
  share_id: string;
  humanCreatedAt: string;
  createdAt: Date;
}

export interface StyleguidePageListResponse {
  status: string;
  data: {
    pages: { id: number; name: string; created_at: string; updated_at: string }[];
  };
}

export interface StyleguidePageData {
  id: number;
  name: string;
  url: string;
  introduction: string;
  content?: string;
  tabs?: { name: string; order: number; content: string }[];
  locked: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface StyleguidePageResponse {
  status: string;
  data: {
    page: StyleguidePageData;
  };
}

export function formatPageName(name?: string) {
  if (name === "___cover") {
    return "Cover Page";
  }

  return name ?? "Untitled page";
}

export async function getStyleguides() {
  return getFromAPI<StyleguideListResponse>("/styleguides");
}

async function getFromAPI<R>(path: string): Promise<R | undefined> {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();
  try {
    if (!clientId || !accessToken) {
      throw new Error("Configure your Client ID and Access Token before running this command.");
    }

    const response = await fetch(BASE_URL + path, {
      method: "GET",
      headers: getAuthHeaders(clientId, accessToken),
    });

    if (!response.ok) {
      throw new Error(`Invalid response from server: ${response.status}`);
    }

    const payload = await response.json();

    return payload as R;
  } catch (error) {
    if (error instanceof Error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Something went wrong calling the zeroheight API.",
      });

      return;
    }
  }
}

export function getAuthHeaders(clientId: string, accessToken: string) {
  return {
    "X-API-CLIENT": clientId,
    "X-API-KEY": accessToken,
    "Content-Type": "application/json",
  };
}

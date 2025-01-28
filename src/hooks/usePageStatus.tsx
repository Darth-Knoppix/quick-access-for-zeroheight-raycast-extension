import { getPreferenceValues } from "@raycast/api";
import { BASE_URL, getAuthHeaders, PageStatusResponse } from "../utils";
import { useFetch } from "@raycast/utils";

export function usePageStatus(pageId: number) {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();

  return useFetch(`${BASE_URL}/pages/${pageId}/status`, {
    method: "GET",
    headers: getAuthHeaders(clientId, accessToken),
    keepPreviousData: true,
    mapResult(rawResponse: PageStatusResponse) {
      return {
        data: rawResponse.data,
      };
    },
  });
}

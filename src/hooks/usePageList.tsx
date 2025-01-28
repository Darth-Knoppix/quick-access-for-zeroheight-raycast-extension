import { getPreferenceValues } from "@raycast/api";
import { BASE_URL, formatPageName, getAuthHeaders, StyleguidePageListResponse } from "../utils";
import { useFetch } from "@raycast/utils";

export function usePageList(styleguideId: number) {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();

  return useFetch(`${BASE_URL}/styleguides/${styleguideId}/pages`, {
    method: "GET",
    headers: getAuthHeaders(clientId, accessToken),
    mapResult(rawResponse: StyleguidePageListResponse) {
      const pages = rawResponse.data.pages.map((page) => {
        const createdAt = new Date(page.created_at);
        const updatedAt = new Date(page.updated_at || page.created_at);

        return {
          ...page,
          name: formatPageName(page.name),
          createdAt,
          humanCreatedAtDate: createdAt.toLocaleDateString(),
          updatedAt,
          humanUpdatedAtDate: updatedAt.toLocaleDateString(),
        };
      });

      return {
        data: pages,
      };
    },
  });
}

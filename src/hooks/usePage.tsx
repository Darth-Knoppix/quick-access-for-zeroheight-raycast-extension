import { getPreferenceValues } from "@raycast/api";
import { BASE_URL, formatPageName, getAuthHeaders, StyleguidePageResponse } from "../utils";
import { useFetch } from "@raycast/utils";

export function usePage(pageId: number) {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();

  const props = useFetch(`${BASE_URL}/pages/${pageId}`, {
    method: "GET",
    headers: getAuthHeaders(clientId, accessToken),
    keepPreviousData: true,
    failureToastOptions: {
      title: "Failed to get the page",
      message: "Please try again later",
      primaryAction: {
        title: "Reload page",
        onAction: (toast) => {
          props.revalidate();
          toast.hide();
        },
      },
    },
    mapResult(rawResponse: StyleguidePageResponse) {
      const page = rawResponse.data.page;

      const createdAt = new Date(page.created_at);
      const updatedAt = new Date(page.updated_at || page.created_at);

      return {
        data: {
          ...page,
          name: formatPageName(page.name),
          createdAt,
          humanCreatedAtDate: createdAt.toLocaleDateString(),
          updatedAt,
          humanUpdatedAtDate: updatedAt.toLocaleDateString(),
        },
      };
    },
  });

  return props;
}

import { getPreferenceValues } from "@raycast/api";
import { BASE_URL, getAuthHeaders, StyleguideListItemData, StyleguideListResponse } from "../utils";
import { useFetch } from "@raycast/utils";

export function useStyleguideList() {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();

  const props = useFetch<StyleguideListResponse, StyleguideListItemData[], StyleguideListItemData[]>(
    BASE_URL + "/styleguides",
    {
      method: "GET",
      headers: getAuthHeaders(clientId, accessToken),
      keepPreviousData: true,
      failureToastOptions: {
        title: "Failed to get styleguide list",
        message: "Please try again later",
        primaryAction: {
          title: "Reload styleguide list",
          onAction(toast) {
            props.revalidate();
            toast.hide();
          },
        },
      },
      mapResult(rawResponse) {
        const styleguides = rawResponse.data.styleguides.map((styleguide) => ({
          ...styleguide,
          name: styleguide.name ?? "Untitled styleguide",
          humanCreatedAt: new Date(styleguide.created_at).toLocaleDateString(),
          createdAt: new Date(styleguide.created_at),
        }));

        return {
          data: styleguides,
        };
      },
    },
  );

  return props;
}

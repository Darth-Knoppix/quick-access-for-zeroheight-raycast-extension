import { ActionPanel, Action, List, getPreferenceValues } from "@raycast/api";
import { useFetch, useCachedState } from "@raycast/utils";
import { useEffect, useState } from "react";

import { BASE_URL, getAuthHeaders, StyleguideListItemData, StyleguideListResponse } from "./utils";
import { StyleguidePageList } from "./subviews/StyleguidePageList";

export default function Command() {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();
  const [sorting, setSorting] = useCachedState("styleguide-list-sorting", "name");

  const { data, isLoading, revalidate } = useFetch<
    StyleguideListResponse,
    StyleguideListItemData[],
    StyleguideListItemData[]
  >(BASE_URL + "/styleguides", {
    method: "GET",
    headers: getAuthHeaders(clientId, accessToken),
    keepPreviousData: true,
    failureToastOptions: {
      title: "Failed to get styleguide list",
      message: "Please try again later",
      primaryAction: {
        title: "Reload styleguide list",
        onAction: (toast) => {
          revalidate();
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
  });
  const [sortedStyleguides, setSortedStyleguides] = useState<StyleguideListItemData[]>([]);

  useEffect(() => {
    if (!data) return;

    let newSortedStyleguides = [...data];
    if (sorting === "name") {
      newSortedStyleguides = data?.toSorted((a, b) => a.name.localeCompare(b.name));
    } else if (sorting === "created_at") {
      newSortedStyleguides = data?.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    setSortedStyleguides(newSortedStyleguides);
  }, [sorting, data]);

  return (
    <List
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Order the list of styleguides"
          onChange={(newSortingMethod) => {
            setSorting(newSortingMethod);
          }}
        >
          <List.Dropdown.Item title="Alphabetical" value="name" />
          <List.Dropdown.Item title="Newest" value="created_at" />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <Action title="Reload" onAction={() => revalidate()} />
        </ActionPanel>
      }
    >
      {sortedStyleguides?.map((styleguide) => (
        <List.Item
          key={styleguide.id}
          title={styleguide.name}
          subtitle={`Created ${styleguide.humanCreatedAt}`}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Styleguide Pages"
                target={<StyleguidePageList styleguideId={styleguide.id} styleguideName={styleguide.name} />}
              />
              <Action.OpenInBrowser url={`https://zeroheight.com/${styleguide.share_id}`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

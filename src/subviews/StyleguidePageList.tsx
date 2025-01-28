import { ActionPanel, Action, List, getPreferenceValues } from "@raycast/api";
import { useFetch, useCachedState } from "@raycast/utils";
import { useEffect, useState } from "react";

import { BASE_URL, formatPageName, getAuthHeaders, StyleguidePageListResponse } from "../utils";
import { StyleguidePage } from "./StyleguidePage";

interface StyleguidePageListProps {
  styleguideId: number;
  styleguideName: string;
}

export function StyleguidePageList({ styleguideId, styleguideName }: StyleguidePageListProps) {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();
  const [sorting, setSorting] = useCachedState("page-list-sorting", "name");

  if (!clientId || !accessToken) {
    return null;
  }

  const { data, isLoading, revalidate } = useFetch(`${BASE_URL}/styleguides/${styleguideId}/pages`, {
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
  const [sortedPages, setSortedPages] = useState(data);

  useEffect(() => {
    if (!data) return;

    let newSortedPages = [...data];
    if (sorting === "name") {
      newSortedPages = data?.toSorted((a, b) => a.name.localeCompare(b.name));
    } else if (sorting === "created_at") {
      newSortedPages = data?.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sorting === "updated_at") {
      newSortedPages = data?.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    setSortedPages(newSortedPages);
  }, [sorting, data]);

  return (
    <List
      navigationTitle={`${styleguideName ?? "Styleguide"} Pages`}
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Order the list of pages"
          onChange={(newSortingMethod) => {
            setSorting(newSortingMethod);
          }}
        >
          <List.Dropdown.Item title="Alphabetical" value="name" />
          <List.Dropdown.Item title="Recently updated" value="updated_at" />
          <List.Dropdown.Item title="Newest" value="created_at" />
        </List.Dropdown>
      }
      actions={
        <ActionPanel>
          <Action title="Reload" onAction={() => revalidate()} />
        </ActionPanel>
      }
    >
      {sortedPages?.map((page) => (
        <List.Item
          key={page.id}
          title={page.name}
          subtitle={`Updated ${page.humanUpdatedAtDate}`}
          actions={
            <ActionPanel>
              <Action.Push title="View Page" target={<StyleguidePage pageId={page.id} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

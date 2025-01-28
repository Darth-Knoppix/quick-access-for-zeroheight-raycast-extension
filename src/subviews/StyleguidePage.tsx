import { Action, ActionPanel, Detail, getPreferenceValues, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";

import { BASE_URL, formatPageName, getAuthHeaders, StyleguidePageData, StyleguidePageResponse } from "../utils";

interface StyleguidePageProps {
  pageId: number;
}

export function StyleguidePage({ pageId }: StyleguidePageProps) {
  const { clientId, accessToken } = getPreferenceValues<Preferences>();

  if (!clientId || !accessToken) {
    return null;
  }

  const { data, isLoading, revalidate } = useFetch(`${BASE_URL}/pages/${pageId}`, {
    method: "GET",
    headers: getAuthHeaders(clientId, accessToken),
    keepPreviousData: true,
    failureToastOptions: {
      title: "Failed to get the page",
      message: "Please try again later",
      primaryAction: {
        title: "Reload page",
        onAction: (toast) => {
          revalidate();
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

  return (
    <Detail
      navigationTitle={data?.name ?? "Page"}
      isLoading={isLoading}
      markdown={data ? getContentOrDefault(data) : ""}
      metadata={
        data &&
        !isContentEmpty(data) && (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Visibility"
              text={data.hidden ? "Hidden" : "Visible"}
              icon={data.hidden ? Icon.EyeDisabled : Icon.Eye}
            />
            <Detail.Metadata.Label
              title="Security"
              text={data.locked ? "Locked" : "Accessible"}
              icon={data.locked ? Icon.Lock : Icon.LockUnlocked}
            />
          </Detail.Metadata>
        )
      }
      actions={
        <ActionPanel>
          {data && <Action.OpenInBrowser url={data.url} />}
          <Action title="Reload" onAction={() => revalidate()} />
        </ActionPanel>
      }
    />
  );
}

function isContentEmpty(page: Pick<StyleguidePageData, "tabs" | "content">) {
  if (!page.content && !page.tabs) return true;
  if (page.content && page.content?.length === 0) return true;
  if (page.tabs && page.tabs.length === 0) return true;

  return false;
}

function getContentOrDefault(page: Pick<StyleguidePageData, "tabs" | "content">) {
  if (isContentEmpty(page)) {
    return `# No content found\n_This could be because there are blocks which the API can't currently display or there is no content on the page._`;
  }

  if (page.tabs) {
    return page.tabs
      .toSorted((tabA, tabB) => tabB.order - tabA.order)
      .reduce((acc, curr) => acc + `${curr.name}\n\n---\n\n${curr.content}`, "");
  }

  return page.content;
}

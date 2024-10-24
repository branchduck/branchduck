export const dashboardStore = $state<{
    pages: { title: string; url: string }[];
}>({
    pages: [],
});

export function setPages(value: { title: string; url: string }[]) {
    dashboardStore.pages = value;
}

export function addPage(value: { title: string; url: string }) {
    dashboardStore.pages.push(value);
}

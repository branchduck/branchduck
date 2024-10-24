<script lang="ts">
import { dashboardStore, setPages } from "@pages/dashboard/_stores/dashboardStore.svelte";

interface Props {
    pages: { title: string; url: string }[];
}

const { pages }: Props = $props();

setPages(pages);
</script>

<table>
    <caption>Pages</caption>
    <thead>
        <tr>
            <th>Title</th>
            <th>Url</th>
        </tr>
    </thead>
    <tbody>
        {#each dashboardStore.pages as page (page.url)}
          <tr>
            <td>{page.title}</td>
            <td>{page.url}</td>
          </tr>
        {/each}
    </tbody>
</table>


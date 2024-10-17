<template>
    <table>
        <caption>
            Pages
        </caption>
        <thead>
            <tr>
                <th>Title</th>
                <th>Url</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="page in store.pages">
                <td>{{ page.title }}</td>
                <td>{{ page.url }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { useDashboardStore } from "@pages/dashboard/_stores/dashboardStore";

const store = useDashboardStore();
const props = defineProps<{ pages: { title: string; url: string }[] }>();

store.setPages(props.pages);
</script>

import { defineStore } from "pinia";
import { ref } from "vue";

export const useDashboardStore = defineStore("dashboard", () => {
    const pages = ref<{ title: string; url: string }[]>([]);

    function addPage(value: { title: string; url: string }) {
        pages.value.push(value);
    }

    function setPages(value: { title: string; url: string }[]) {
        pages.value = value;
    }

    return {
        pages,
        addPage,
        setPages,
    };
});

<template>
    <form ref="add-page-form" @submit.prevent="addPage">
        <div>
            <label for="page-title">Title</label>
            <input
                ref="add-page-form-title-input"
                type="text"
                id="page-title"
                name="title"
            />
        </div>
        <div>
            <label for="page-url">Url</label>
            <input type="text" id="page-url" name="url" />
        </div>
        <div>
            <button type="submit">Add page</button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useDashboardStore } from "@pages/dashboard/_stores/dashboardStore";

const store = useDashboardStore();
const addPageForm = useTemplateRef("add-page-form");
const addPageFormTitleInput = useTemplateRef("add-page-form-title-input");

async function addPage(event) {
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const response = await fetch("/api/v1/pages", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();

    store.addPage(data);

    addPageForm.value.reset();
    addPageFormTitleInput.value.focus();
}
</script>

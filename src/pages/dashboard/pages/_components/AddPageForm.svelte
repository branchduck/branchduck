<script lang="ts">
import { addPage } from "@pages/dashboard/_stores/dashboardStore.svelte";

let addPageForm: HTMLFormElement;
let addPageFormTitleInput: HTMLInputElement;

async function submit(event: SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const response = await fetch("/api/v1/pages", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();

    addPage(data);

    addPageForm.reset();
    addPageFormTitleInput.focus();
}
</script>

<form bind:this={addPageForm} onsubmit={submit}>
    <div>
        <label for="page-title">Title</label>
        <input
            bind:this={addPageFormTitleInput}
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
        <button>Add page</button>
    </div>
</form>

<script>
  import { menuModalType } from "../store";
  import Dialog from "./Dialog.svelte";
</script>

{#if $menuModalType === "createData"}
  <Dialog title="Make new column">Do stuff in here</Dialog>
{/if}

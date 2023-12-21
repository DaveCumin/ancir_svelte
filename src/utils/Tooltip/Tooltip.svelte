<script>
  export const title = "";
  export let x;
  export let y;
  export let xval;
  export let yval;
</script>

<div
  class="fixed pointer-events-nonne border rounded-lg shadow-xl bg-blue-300 border-sm px-3 py-2 text-gray-800 text-xl font-semibold z-[1000]"
  style="top: {y + 5}px;left: {x + 5}px;"
>
  <p>x: {xval}</p>
  <p>y: {yval}</p>
</div>

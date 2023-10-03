<script>
  export let title
  export let x
  export let y
  export let xval
  export let yval
 
</script>

<div
  style="top: {y + 5}px;left: {x + 5}px;"
>
<p>x: {xval}</p>
<p>y: {yval}</p>  
</div>

<style>

  div {
    pointer-events: none;
    border: 1px solid black;
    background: whitesmoke;
    border-radius: 4px;
    padding: 0 4px 0 4px;
    position: fixed;
    color: black;
    font-size: 1rem;
    font-weight: 600;
    z-index: 99999;
    line-height: 4px;

  }

</style>

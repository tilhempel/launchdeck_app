<script>
  let { onclick, children } = $props();

</script>

<button onclick={onclick} class="ActionButton">
  {@render children()}
</button>

<style>
.ActionButton {
  cursor: pointer;
  border: none;
  border-radius: 5px;
  padding: 10px;
  box-shadow: none;
  height: 100px;
  width: 100px;
}

.ActionButton > :global(i) {
  font-size: 30px;
}
.ActionButton > :global(span) {
  margin-top: 10px;
}

.ActionButton:hover {
  border-color: #396cd8;
}
.ActionButton:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}
@media (prefers-color-scheme: dark) {
  .ActionButton {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  .ActionButton:active {
    background-color: #0f0f0f69;
  }
}
</style>
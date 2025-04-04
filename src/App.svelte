<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Router from "svelte-spa-router";
  import Converter from "./routes/Converter.svelte";
  import Charts from "./routes/Charts.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import About from "./routes/About.svelte";
  import GoldConverter from "./routes/GoldConverter.svelte";

  const routes = {
    "/": Converter,
    "/charts": Charts,
    "/about": About,
    "/gold": GoldConverter,
    "*": NotFound,
  };
</script>

<Navbar />

<Router {routes} />

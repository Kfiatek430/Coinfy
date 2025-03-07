<script lang="ts">
  import Navbar from "./components/Navbar.svelte";
  import Router from "svelte-spa-router";
  import Converter from "./routes/Converter.svelte";
  import Charts from "./routes/Charts.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Coinpedia from "./routes/Coinpedia.svelte";
  import About from "./routes/About.svelte";

  const routes = {
    '/': Converter,
    '/charts': Charts,
    '/coinpedia': Coinpedia,
    '/about': About,
    '*': NotFound,
  }

</script>

<Navbar />

<Router {routes} />

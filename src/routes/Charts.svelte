<script>
	import CurrencyChart from "./../components/CurrencyChart.svelte";
	let currency = "";
</script>

<div class="relative">
    <div
      class="absolute inset-0 bg-gradient-to-b from-blue-900 from-80% to-white to-30%"
    ></div>
  
    <div class="relative px-4 py-8 text-center text-white">
      <h1
        class="relative pt-15 mb-4 z-10 text-4xl text-center leading-none tracking-tight md:text-4xl lg:text-5xl text-white flex flex-col"
      > 
      Charts</h1>
    <h1>Currency Rate Chart</h1>
    <div class="relative pt-15 mb-4 z-10 text-l text-center leading-none tracking-tight md:text-xl lg:text-2xl text-black">
        <CurrencyChart currency={currency} />
    </div>
    </div>
  </div>

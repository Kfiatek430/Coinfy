<script>
    import { onMount } from 'svelte';
    import CurrencyChart from './../components/CurrencyChart.svelte';
    import CurrencyToCurrencyChart from './../components/CurrencyToCurrencyChart.svelte';
    import { SharedService } from './../shared/share.service';
    const shared = new SharedService();

    let currencyCode1 = "USD"; 
    let currencyCode2 = "EUR"; 
    let currencies = []; 

    onMount(async () => {
        try {
            let tables = await shared.getTables(); 
            currencies = tables.map((element) => ({
                code: element.code,
                currency: element.currency,
            }));
        } catch (error) {
            console.error("Failed to fetch tables:", error);
        }
    });

    function handleCurrencyChange1(event) {
        currencyCode1 = event.target.value; 
    }

    function handleCurrencyChange2(event) {
        currencyCode2 = event.target.value; 
    }
</script>

<div class="relative min-h-screen flex flex-col items-center justify-center">
    <div
        class="absolute inset-0 bg-gradient-to-b from-blue-900 from-80% to-white to-30%"
    ></div>

    <div class="relative z-10 text-center text-black px-4 py-8 w-full max-w-4xl">
        <h1 class="text-4xl font-bold mt-12 mb-6 text-white">Currency Rate Chart</h1>

        <select
            bind:value={currencyCode1}
            on:change={handleCurrencyChange1}
            class="mb-6 p-3 border border-gray-300 text-black bg-white
            hover:bg-gray-100 focus:ring-2 focus:ring-blue-600 focus:outline-none
            focus:border-blue-600 font-medium rounded-lg text-sm px-4 py-2
            text-center" id="currencySelect1">
            {#each currencies as currency}
                <option value={currency.code}>{currency.code}, {currency.currency}</option>
            {/each}
        </select>

        <div class="bg-white shadow-lg rounded-lg p-6">
            <CurrencyChart currencyCode={currencyCode1} />
        </div>
    </div>

    <div class="relative z-10 text-center text-black px-4 py-8 w-full max-w-4xl">
        <h1 class="text-4xl font-bold mb-6 text-white">Currency Comparison Chart</h1>

        <select
            bind:value={currencyCode1}
            on:change={handleCurrencyChange1}
            class="mb-6 p-3 border border-gray-300 text-black bg-white
            hover:bg-gray-100 focus:ring-2 focus:ring-blue-600 focus:outline-none
            focus:border-blue-600 font-medium rounded-lg text-sm px-4 py-2
            text-center" id="currencySelect1">
            {#each currencies as currency}
                <option value={currency.code}>{currency.code}, {currency.currency}</option>
            {/each}
        </select>

        <select
            bind:value={currencyCode2}
            on:change={handleCurrencyChange2}
            class="mb-6 p-3 border border-gray-300 text-black bg-white
            hover:bg-gray-100 focus:ring-2 focus:ring-blue-600 focus:outline-none
            focus:border-blue-600 font-medium rounded-lg text-sm px-4 py-2
            text-center" id="currencySelect2">
            {#each currencies as currency}
                <option value={currency.code}>{currency.code}, {currency.currency}</option>
            {/each}
        </select>

        <div class="bg-white shadow-lg rounded-lg p-6">
            <CurrencyToCurrencyChart currencyCode1={currencyCode1} currencyCode2={currencyCode2} />
        </div>
    </div>
</div>

<style>
    select {
        width: fit-content;
    }
</style>

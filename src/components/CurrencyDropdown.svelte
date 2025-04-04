<script lang="ts">
  import { onMount } from "svelte";
  import type { Currency } from "../interfaces/currency";

  let open = false;
  let searchTerm = "";

  export let selectedCurrency: Currency;
  export let excludedCurrency: Currency;
  export let currencies: Currency[];
  export let change;
  export let id: String;

  $: filteredCurrencies = currencies.filter((currency) =>
    (currency.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    currency != excludedCurrency
  );

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(`#dropdown${id}`)) {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });
</script>

<div class="relative w-full lg:w-1/2 currency-dropdown" id={`dropdown${id}`}>
  <button
    on:click={() => (open = !open)}
    class="w-full flex items-center h-20 justify-between p-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
  >
    <div class="flex items-center gap-3">
      <!-- <img
        src={`https://www.xe.com/svgs/flags/${selectedCurrency.countryCode}.static.svg`}
        alt={selectedCurrency.code}
        class="w-6 h-6 rounded-full border"
      /> -->
      <div class="text-left">
        <span class="font-semibold">{selectedCurrency.code}</span>
        <span class="text-gray-500 ml-2">{selectedCurrency.currency}</span>
      </div>
    </div>
    <svg
      class={`w-4 transform transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 16 10"
    >
      <path
        fill="currentColor"
        d="M8 9.5L.5 2 1.55.95 8 7.4 14.45.95 15.5 2 8 9.5z"
      />
    </svg>
  </button>

  {#if open}
    <div
      class="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-50"
    >
      <div class="p-2 border-b border-gray-300">
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="Search currency..."
          class="w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <ul class="max-h-60 overflow-y-auto">
        {#each filteredCurrencies as currency}
          <li>
            <button
              on:click={() => {
                selectedCurrency = currency;
                open = false;
                change();
              }}
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors"
            >
              <!-- <img
                src={`https://www.xe.com/svgs/flags/${currency.countryCode}.static.svg`}
                alt={currency.code}
                class="w-6 h-6 rounded-full border"
              /> -->
              <div class="text-left">
                <span class="font-semibold">{currency.code}</span>
                <span class="text-gray-500 ml-2">{currency.currency}</span>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
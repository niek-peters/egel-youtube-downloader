<script lang="ts">
	import Fa from 'svelte-fa';
	import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';

	import { Circle } from 'svelte-loading-spinners';
	import { onMount } from 'svelte';
	import Card from '../components/Card.svelte';

	let url: string;
	let downloadError: string;
	let showError = false;

	let processing = false;
	let done = false;
	let fileName = '';

	onMount(() => {
		const source = new EventSource('http://localhost:3000/api/download/events');

		source.addEventListener('message', (message) => {
			if (!message || !message.data) return;
			const data = JSON.parse(message.data);

			if (data.status == 'processingComplete') {
				processing = false;

				done = true;
				fileName = data.fileName;

				setTimeout(() => {
					done = false;
				}, 4000);
			}
		});
	});

	async function download() {
		try {
			if (!url) throw new Error('Je moet een URL opgeven!');

			const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			const match = url.match(regExp);

			let uid: string;

			if (match && match[2].length == 11) {
				uid = match[2];
			} else {
				throw new Error('De URL is niet geldig');
			}

			url = '';

			processing = true;

			fetch(`http://localhost:3000/api/download/${uid}`);
		} catch (e) {
			if (e as Error) {
				let err = e as Error;

				console.error(e);
				downloadError = err.message;
				showError = true;

				processing = done = false;

				setTimeout(() => {
					showError = false;
					setTimeout(() => {
						downloadError = '';
					}, 150);
				}, 2000);
			}
		}
	}
</script>

<Card>
	<div class="relative wrapper flex flex-col items-center h-full w-full">
		<h1 class="text-6xl">Download hier je YouTube video's!</h1>
		<div class="h-px w-full bg-white/30 my-8" />
		{#if processing}
			<section class="w-full h-full flex flex-col items-center justify-center">
				<h2 class="text-4xl mb-12 text-gray-600">Je video wordt verwerkt...</h2>
				<div class="loading-container">
					<Circle color="#9CA3AF" size="10" unit="vw" />
				</div>
			</section>
		{:else}
			<form
				class="form flex flex-col items-center w-full h-full gap-8"
				on:submit|preventDefault={download}
			>
				<div class="flex w-full">
					<input
						class="w-3/4 outline-none border-gray-200 border-2 rounded-l-lg text-xl p-2 focus:border-blue-500 transition"
						type="url"
						required
						placeholder="Plak hier je YouTube URL"
						bind:value={url}
					/>
					<button
						class="w-1/4 flex items-center justify-center gap-4 text-xl bg-blue-400 hover:bg-blue-500 transition py-2 px-4 rounded-r-lg"
					>
						<Fa icon={faFileArrowDown} /> Download MP4
					</button>
				</div>
			</form>
		{/if}

		<div
			class={`absolute bottom-0 flex items-center justify-center w-full text-2xl bg-red-400 p-2 rounded-lg ${
				showError ? 'opacity-100' : 'opacity-0'
			} slow-transition`}
		>
			{downloadError}
		</div>
		<div
			class={`absolute bottom-0 flex items-center justify-center w-full text-2xl bg-green-400 p-2 rounded-lg ${
				done ? 'opacity-100' : 'opacity-0'
			} slow-transition`}
		>
			"{fileName}" gedownload!
		</div>
	</div>
</Card>

<style lang="scss">
	.loading-container {
		height: 10vw;
	}

	.slow-transition {
		transition-property: color, background-color, border-color, text-decoration-color, fill,
			stroke, opacity, box-shadow, transform, filter, backdrop-filter;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 350ms;
	}
</style>

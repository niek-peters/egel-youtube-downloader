<script>
	import '../app.css';

	import Header from '../components/Header.svelte';
</script>

<div class="background w-screen min-h-screen max-h-screen bg-cover bg-no-repeat">
	<Header />
	<main class="flex items-center justify-center -mt-12">
		<slot />
	</main>
</div>

<style lang="scss">
	.background {
		background-image: url('/bg-1.svg');
	}

	:root {
		// Extra small screen (xs)
		@media only screen and (min-width: 400px) {
			font-size: 1.5vw;
		}

		// Small screen (s)
		@media only screen and (min-width: 600px) {
			font-size: 1.4vw;
		}

		// Medium screen (md)
		@media only screen and (min-width: 800px) {
			font-size: 1.3vw;
		}

		// Large screen (l)
		@media only screen and (min-width: 1000px) {
			font-size: 1.1vw;
		}

		// Extra large screen (lg)
		@media only screen and (min-width: 1200px) {
			font-size: 1vw;
		}
	}
</style>

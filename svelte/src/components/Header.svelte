<script>
	import Fa from 'svelte-fa';
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<header class="relative flex w-full z-10">
	<div class="logo p-3.5">
		<a
			href="https://github.com/MrValk/egel-youtube-downloader"
			class="rounded-full flex w-fit hover:scale-105 transition"
		>
			<Fa icon={faGithub} class="icon text-5xl text-white" />
		</a>
	</div>
	<div class="flex items-center titlebar p-2 h-20">
		<h1 class="text-4xl font-bold">Egel YouTube Downloader</h1>
	</div>
</header>

<style lang="scss">
	.logo {
		height: 8rem;
		width: 8rem;
		background-image: -webkit-linear-gradient(-45deg, black 50%, transparent 51%);
	}
</style>

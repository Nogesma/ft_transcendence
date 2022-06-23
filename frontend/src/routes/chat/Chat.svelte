
<script lang="ts">
    import {push} from "svelte-spa-router";
    import {onMount} from "svelte";
	import Axios from "axios";
	let msg:string;
	let ina:number;
	let arr:Array<string>;
	arr = new Array<string>;
    import { io } from "socket.io-client";
		const socket = io("http://localhost:3000");
		socket.on('connect',function() {
			console.log("connected");
		});
    socket.on('events', function (event) {
	    arr = event;
		console.log(arr)
		ina += 1;
    });
		function sendmsg()
		{
			socket.emit("events", msg)
        }
</script>
{#if arr[0]}
    <h1>test</h1>
    {#each arr as item, ina}
        <li>{ina + 1}: {item}</li>
        {/each}
{/if}
<h1>Hello world</h1>
<input bind:value={msg}>
<button on:click="{sendmsg}">
    send message
</button>
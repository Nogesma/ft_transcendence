
<script lang="ts">
    import {push} from "svelte-spa-router";
    import {onMount} from "svelte";
	import Axios from "axios";
	let str:string;
	let msg:string;
    import { io } from "socket.io-client";
		const socket = io("http://localhost:3000");
		socket.on('connect',function() {
			console.log("connected");

			socket.emit("events", msg);
		});
		socket.on('events', function (event) {
			console.log('received events', event);
			str = event;
		});
		function sendmsg()
		{
			socket.emit("events", msg)
        }
</script>
<h1>{str}</h1>
<h1>Hello world</h1>
<input bind:value={msg}>
<button on:click="{sendmsg}">
    send message
</button>
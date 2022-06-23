
<script lang="ts">
    import {push} from "svelte-spa-router";
    import {onMount} from "svelte";
	import Axios from "axios";
	let str:string;
    import { io } from "socket.io-client";
		const socket = io("http://localhost:3000");
		socket.on('connect',function() {
			console.log("connected");

			socket.emit("events", {test: 'events'});
		});
		socket.on('events', function (data) {
			console.log('received events', data.test);
			str = data.test;
		});
</script>
<h1>{str}</h1>
<h1>Hello world</h1>
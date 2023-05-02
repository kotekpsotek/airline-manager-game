<script lang="ts">
    import { ArrowDown } from "carbon-icons-svelte";

    export let elementToScroll: HTMLElement;

    let buttonScrollDown: HTMLElement;

    function scrollDownWindow(ev: Event) {
        elementToScroll.scroll({ behavior: "smooth", left: 0, top: elementToScroll.scrollHeight })
    }

    elementToScroll.addEventListener("scroll", ev => {
        console.log(elementToScroll.scrollTop, elementToScroll.scrollHeight)
        if (elementToScroll.scrollTop + 1000 >= elementToScroll.scrollHeight) {
            buttonScrollDown.setAttribute("style", "display: none;");
        } else buttonScrollDown.removeAttribute("style");
    });
</script>

<button class="scroll-down" on:click={scrollDownWindow} bind:this={buttonScrollDown}>
    <ArrowDown size={20} fill="whitesmoke"/>
</button>

<style>
    button.scroll-down {
        width: 50px;
        height: 50px;
        position: absolute;
        bottom: 5px;
        right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: solid white 2px;
        border-radius: 50%;
        background-color: green;
    }
</style>
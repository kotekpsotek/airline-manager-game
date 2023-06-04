<!-- Custom table element -->
<script lang="ts">
    import style from "./Table.css";
</script>

<table>
    <tr>
        <slot></slot>
    </tr>
    <slot name="rows"></slot>
</table>

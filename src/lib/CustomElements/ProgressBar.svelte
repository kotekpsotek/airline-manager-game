<script lang="ts">
    export let valuePercentage: number = 0;

    /** Update progress bar value when value for **"data-value"** attribute from progress bar element has been changed */
    function update(node: HTMLDivElement) {
        setInterval(() => {
            let dataValuePercentage = Number(node.getAttribute("data-value"));
            if (dataValuePercentage > 100) dataValuePercentage = 100;
    
            const progressBarValueIndicator = node.querySelector(".value") as HTMLDivElement;
            progressBarValueIndicator.style.width = `${dataValuePercentage}%`;
        });

        return {};
    }
</script>

<div class="progress-bar" data-value="0" use:update>
    <div class="value" style:width="{valuePercentage <= 100 ? `${valuePercentage}%` : "100%"}"></div>
</div>

<style>
    .progress-bar {
        width: 100%;
        height: 15px;
        background-color: white;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        overflow: hidden;
    }

    .value {
        height: 100%;
        background-color: green;
    }
</style>

<span class="shade">
    <span class="background" />
    <span class="foreground">
        <slot />
    </span>
</span>

<style lang="scss">
    .shade {
        position: relative;
    }
    .background {
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        background: var(--fill);
        opacity: 0.5;
    }
    .foreground {
        color: var(--stroke);
    }
    :global(#app.light) {
        .background {
            mix-blend-mode: hard-light;
        }
        .foreground {
            mix-blend-mode: luminosity;
        }
    }
    :global(#app.dark) {
        .background {
            mix-blend-mode: multiply;
        }
        .foreground {
            mix-blend-mode: luminosity;
        }
    }
</style>

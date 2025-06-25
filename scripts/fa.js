hexo.extend.tag.register('fa', function(args) {
    if (!args.length) return '';

    const icon = args[0];
    let size = '';
    let style = 'solid';
    const extraClasses = [];

    const sizes = ['lg', 'xl', '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', '2xl'];
    const styles = ['solid', 'regular', 'brands'];
    const rotations = ['rotate-90', 'rotate-180', 'rotate-270'];
    const animations = ['spin', 'pulse', 'spin-pulse', 'spin-reverse', 'beat', 'beat-fade']; // ← 여기에 추가
    const flips = ['flip-horizontal', 'flip-vertical'];
    const others = ['border', 'fw', 'inverse'];

    args.slice(1).forEach(arg => {
        if (sizes.includes(arg)) {
            size = arg;
        } else if (styles.includes(arg)) {
            style = arg;
        } else if (rotations.includes(arg) ||
            animations.includes(arg) ||
            flips.includes(arg) ||
            others.includes(arg)) {
            extraClasses.push(`fa-${arg}`);
        }
    });

    return `<i class="fa-${style} fa-${icon}${size ? ' fa-' + size : ''}${extraClasses.length ? ' ' + extraClasses.join(' ') : ''}"></i>`;
}, { ends: false });
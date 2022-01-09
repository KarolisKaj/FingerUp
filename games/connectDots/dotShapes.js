export default shapes = (dotCount) => {
    let floor = (x) => Math.floor(x);
    let ceil = (x) => Math.ceil(x);
    return [
        [[[0, dotCount - 1], [dotCount - 1, 0]], [[0, 0], [dotCount - 1, dotCount - 1]]],
        [[[0, dotCount - 1], [floor((dotCount - 1) / 2), 0], [dotCount - 1, dotCount - 1]], [[0, ceil(dotCount / 2)], [dotCount - 1, ceil(dotCount / 2)]]],
        [[[dotCount - 1, 0], [floor((dotCount - 1) / 2), 0], [0, 1], [0, dotCount - 1], [floor((dotCount - 1) / 2), dotCount - 1], [dotCount - 1, dotCount - 1]]]
    ]
}

export const RESPFormat =
{
    simpleString: <RegExp>/^\+(.*?)\r\n$/,
    error: <RegExp>/^\-(.*?)\r\n$/,
    integer: <RegExp>/^:\+?-?(\d+)\r\n$/,
    bulkString: <RegExp>/^\$(\d+)\r\n(.*?)\r\n$/,
    array: <RegExp>/^\*(\d+)\r\n(?:.+?\r\n)*$/
};
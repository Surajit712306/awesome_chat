
export function formatDate(date)
{
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let _date = date.getDate();

    if(_date < 10)
    {
        _date = `0${_date}`;
    }

    if(month < 10)
    {
        month = `0${month}`;
    }

    if(year < 10)
    {
        year = `0${year}`;
    }

    const format = `${_date}/${month}/${year}`;
    return format;
}

export function formatAMPM(date)
{
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm': 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const format = `${hours}:${minutes} ${ampm}`;
    return format;
}

export function formatTime(date)
{
    const today = new Date();
    const diffDate = today.getDate() - date.getDate();
    const diffMonth = today.getMonth() - date.getMonth();
    const diffYear = today.getFullYear() - date.getFullYear();


    if(diffYear > 0)
    {
        return `${diffYear} years ago`
    } 

    if(diffMonth > 0)
    {
        return `${diffMonth} months ago`
    }

    if(diffDate > 0)
    {
        return `${diffDate} days ago`;
    }

   return formatAMPM(date);
}

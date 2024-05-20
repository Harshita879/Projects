export default function forumActivity ( { params}: {
    params: { forumId: string;}
} ) {
    return ( 
        <div className="pt-16">
    <h1>
        Post no. {params.forumId} 
    </h1> 
    </div>
    );
}
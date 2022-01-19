import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  results,
  next_page,
}: PostPagination): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  const handleButton = async (): Promise<void> => {
    const response = await (await fetch(next_page)).json();

    const next_page_response = response.next_page;

    const new_posts = await response.results.map(post => {
      const date = format(
        new Date(post.first_publication_date),
        "dd ' ' MMM ' ' yyyy",
        { locale: ptBR }
      );
      return {
        uid: post.uid,
        first_publication_date: date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(next_page_response);
    setPosts([...posts, ...new_posts]);
  };

  return (
    <main className={styles.container}>
      {posts
        ? posts.map(post => (
            <div className={styles.posts}>
              <a>
                <Link href={`/post/${post.uid}`}>
                  <strong>{post.data.title}</strong>
                </Link>
                <p>{post.data.subtitle}</p>
                <div className={styles.postsprops}>
                  <time>
                    <FiCalendar />
                    {post.first_publication_date}
                  </time>
                  <p>
                    <FiUser />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </div>
          ))
        : ''}

      {nextPage ? (
        <button
          type="button"
          className={styles.button}
          onClick={() => handleButton()}
        >
          Carregar mais posts
        </button>
      ) : (
        ''
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: ['publication.title', 'publication.content'], pageSize: 1 }
  );

  const { next_page } = postsResponse;
  const results = postsResponse.results.map(post => {
    const date = format(
      new Date(post.first_publication_date),
      "dd ' ' MMM ' ' yyyy",
      { locale: ptBR }
    );

    return {
      uid: post.uid,
      first_publication_date: date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      results,
      next_page,
    },
  };
};

import Image from 'next/image';
import { ReactElement } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <Link href="/">
      <header className={styles.container}>
        <Image src="/images/Logo.png" alt="logo" width="1120" height="100" />
      </header>
    </Link>
  );
}
